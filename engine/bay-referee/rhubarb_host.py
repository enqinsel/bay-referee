"""Composite the registered BAY REFEREE poses from Rhubarb cues at 30 fps.

MouthTrack accepts the mouthCues array of one final language track. draw_host
returns (RGBA image, top-left position) for a shot with pose, width, x and y.
The caller supplies any editorial motion. A held pose has zero motion controls.
"""

from bisect import bisect_right
from functools import lru_cache
from pathlib import Path
import math

import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates


POSES = Path(__file__).resolve().parents[2] / "brand/bay-referee/avatar/poses"
FPS = 30

# Source-pixel lip registration on the untrimmed 1024 × 1200 drawings.
MOUTHS = {
    "neutral": (500, 224, 540, 223, 0),
    "explain-forward": (495, 229, 536, 229, 0),
    "point-left": (454, 227, 477, 230, 0),
    "point-up-left": (446, 213, 470, 218, 0),
    "confirm": (496, 232, 543, 224, 0),
    "thinking": (511, 226, 545, 215, 0),
    "surprised": (495, 231, 528, 228, 3.4),
    "hands-open": (496, 234, 536, 226, 0),
    "conclusion": (493, 233, 542, 227, 0),
    "compare-both": (491, 232, 530, 224, 0),
}

# Width, aperture, teeth band and tongue height for each Rhubarb shape.
SHAPES = {
    "X": (1, 0, 0, 0), "A": (.85, 0, 0, 0), "B": (.95, 3.1, .40, 0),
    "C": (.95, 8.2, .20, .09), "D": (.84, 14, .17, .24),
    "E": (.65, 9.4, .07, .12), "F": (.43, 6.1, 0, .06),
    "G": (.88, 2.4, .65, 0), "H": (.94, 5.8, .16, .50),
}

# Center, half-width, slope and opening under the aviator lenses.
EYES = {
    "explain-forward": [(490, 183, 12, -.03, 3.3), (540, 183, 12, -.01, 3.5)],
    "neutral": [(494, 181, 12, -.03, 3.4), (544, 180, 12, 0, 3.6)],
    "point-up-left": [(484, 172, 7, .15, 3.5)],
    "point-left": [(481, 182, 7, .08, 3.4)],
    "surprised": [(483, 181, 11, -.10, 5), (532, 179, 11, -.06, 5)],
    "thinking": [(492, 182, 12, -.30, 3.3), (538, 169, 10, -.28, 3.3)],
    "confirm": [(488, 188, 12, -.19, 3.4), (536, 180, 12, -.14, 3.1)],
    "hands-open": [(481, 188, 12, -.18, 3.3), (531, 181, 12, -.14, 3.2)],
    "compare-both": [(477, 185, 11, -.19, 4.3), (526, 176, 12, -.17, 4.3)],
    "conclusion": [(488, 188, 12, -.10, 3.4), (538, 183, 12, -.09, 3.2)],
}

# Palm, elbow and gesture direction in each existing raster pose.
ARMS = {
    "explain-forward": [(386, 480, 350, 414, 1)], "neutral": [],
    "point-left": [(104, 352, 290, 367, -1)],
    "point-up-left": [(196, 162, 253, 278, -1)],
    "surprised": [(348, 430, 352, 518, -1), (684, 430, 681, 522, 1)],
    "thinking": [(520, 293, 431, 433, .18)],
    "confirm": [(356, 339, 307, 433, -1)],
    "hands-open": [(299, 511, 353, 513, -1), (734, 511, 668, 521, 1)],
    "compare-both": [(242, 376, 336, 472, -1), (791, 376, 687, 472, 1)],
    "conclusion": [(521, 551, 381, 500, .19)],
}


def _smooth(value):
    value = np.clip(value, 0, 1)
    return value * value * (3 - 2 * value)


class MouthTrack:
    """Read native Rhubarb times. Pauses and out-of-range frames use X."""

    def __init__(self, records):
        self.cues = tuple((c["start"], c["end"], c["value"]) for c in records)
        self.starts = [c[0] for c in self.cues]
        previous_end = 0
        for start, end, shape in self.cues:
            if (shape not in SHAPES or not math.isfinite(end) or not 0 <= start < end
                    or previous_end > start + 1e-5):
                raise ValueError("Invalid Rhubarb mouth cue")
            previous_end = end

    def at_frame(self, frame):
        t = (frame + .5) / FPS
        i = bisect_right(self.starts, t) - 1
        if i < 0 or t >= self.cues[i][1]:
            return "X", "X", 0.
        start, end, shape = self.cues[i]
        prev = self.cues[max(0, i-1)]
        nxt = self.cues[min(i+1, len(self.cues)-1)]
        before = prev[2] if abs(start-prev[1]) < .02 else "X"
        after = nxt[2] if abs(end-nxt[0]) < .02 else "X"
        half = min(.040, (end-start)*.30)
        if t-start < half and before != shape:
            return before, shape, round((.5+.5*_smooth((t-start)/half))*6)/6
        if end-t < half and after != shape:
            return shape, after, round((.5-.5*_smooth((end-t)/half))*6)/6
        return shape, shape, 0.


@lru_cache(maxsize=10)
def _source(pose):
    if pose not in MOUTHS:
        raise ValueError(f"Unregistered BAY REFEREE pose: {pose}")
    with Image.open(POSES / f"{pose}.png") as image:
        full = image.convert("RGBA")
    first, _, last, _ = full.crop((0, 70, 1024, 625)).getbbox()
    box = (first-24, 55, last+24, 628)
    base = np.array(full.crop(box))
    base[-46:, :, 3] = np.rint(base[-46:, :, 3] * np.linspace(1, 0, 46)[:, None]).astype(np.uint8)
    return full, Image.fromarray(base), box


def _sample_rgb(pixels, y, x):
    return np.stack([
        map_coordinates(pixels[:, :, ch], [y, x], order=1, mode="nearest")
        for ch in range(3)
    ], axis=2).astype(float)


@lru_cache(maxsize=650)
def _mouth_patch(pose, a, b, blend):
    full, _, _ = _source(pose)
    x0, y0, x1, y1, native_gap = MOUTHS[pose]
    cx, cy = (x0+x1)/2, (y0+y1)/2
    left, top = int(cx)-45, int(cy)-45
    patch = full.crop((left, top, left+90, top+90))
    if not 0 <= blend <= 1:
        raise ValueError("Mouth blend must be in [0, 1]")
    endpoints = zip(SHAPES[a], SHAPES[b])
    width, aperture, teeth_band, tongue_band = [(1-blend)*x + blend*y for x, y in endpoints]
    if not native_gap and ((a == "X" and blend == 0) or (b == "X" and blend == 1)):
        return patch, (left, top)

    original = np.asarray(patch)
    yy, xx = np.indices(original.shape[:2], dtype=float)
    dx, dy = xx + left-cx, yy + top-cy
    angle = math.atan2(y1-y0, x1-x0)
    cs, sn = math.cos(angle), math.sin(angle)
    u, v = dx*cs+dy*sn, -dx*sn+dy*cs
    radius = math.hypot(x1-x0, y1-y0)/2
    aperture *= min(1, radius/18)
    falloff = np.exp(-((abs(u)/(radius*1.03))**4) - (v/7.5)**2)
    src_u = u + (1-width)*.55*u*falloff
    profile = np.maximum(0, 1-(u/(radius*width))**2)**.87
    open_top, open_bottom = -aperture*.30*profile, aperture*.70*profile
    src_top, src_bottom = -native_gap*.5*profile, native_gap*.5*profile
    upper = v < (open_top+open_bottom)/2
    disp = np.where(upper, open_top-src_top, open_bottom-src_bottom)
    distance = np.maximum(0, np.where(upper, open_top-v, v-open_bottom))
    src_v = v - disp*np.exp(-(distance/10)**2)
    sx = src_u*cs - src_v*sn + cx-left
    sy = src_u*sn + src_v*cs + cy-top
    warped = _sample_rgb(original, sy, sx)
    if aperture:
        depth = np.clip((v-open_top)/np.maximum(.1, open_bottom-open_top), 0, 1)
        weight = depth*.65 + profile*.22
        cavity = np.array([39, 17, 21]) + np.array([39, 17, 14])*weight[..., None]
        visible = np.clip(np.minimum(v-open_top, open_bottom-v)+.5, 0, 1)*profile**.20
        if teeth_band:
            teeth = np.clip((teeth_band-depth+.03)*aperture, 0, 1)*np.clip((profile-.14)*2, 0, 1)
            cavity = cavity*(1-teeth[..., None]) + np.array([190, 147, 121])*teeth[..., None]
        if tongue_band:
            tongue = np.clip((depth-1+tongue_band*profile)*aperture, 0, 1)
            cavity = cavity*(1-tongue[..., None]) + np.array([142, 72, 67])*tongue[..., None]
        warped = warped*(1-visible[..., None]) + cavity*visible[..., None]
    return Image.fromarray(np.dstack([np.rint(warped).astype(np.uint8), original[:, :, 3]])), (left, top)


@lru_cache(maxsize=24)
def _eye_input(pose, i):
    full, _, _ = _source(pose)
    cx, cy, radius, slope, opening = EYES[pose][i]
    xy = (cx-23, cy-26)
    raw = np.array(full.crop((*xy, cx+24, cy+15)))
    yy, xx = np.indices(raw.shape[:2], dtype=float)
    u = xx-23.
    v = yy-26.-slope*u
    return raw, yy, xx, u, v, xy, radius, slope, opening


def _eye_patch(pose, i, blink, brow, gaze):
    raw, yy, xx, u, v, xy, radius, slope, opening = _eye_input(pose, i)
    lens = np.maximum(0, 1-(u/radius)**2)**.75
    top, bottom = -opening*lens, opening*lens
    lid_top = top + (bottom-top)*.84*blink
    lid_bottom = bottom - (bottom-top)*.16*blink
    inside = abs(u) < radius
    upper = inside & (v < lid_top)
    lower = inside & (v > lid_bottom)
    middle = inside & ~upper & ~lower
    su, sv = u.copy(), v.copy()
    sv[upper] -= (lid_top-top)[upper]*np.exp(-((lid_top-v)[upper]/4.4)**2)
    sv[lower] += (bottom-lid_bottom)[lower]*np.exp(-((v-lid_bottom)[lower]/3.3)**2)
    sv[middle] = (top[middle] + (v[middle]-lid_top[middle])*(bottom[middle]-top[middle])
                  / np.maximum(.055, (lid_bottom-lid_top)[middle]))
    su[middle] -= gaze*.90*(1-blink)*lens[middle]*np.maximum(0, 1-(sv[middle]/(opening+.5))**2)
    brow_weight = np.exp(-((u/(radius*1.1))**4)-((v+16)/5.2)**2)
    sv += 1.45*brow*brow_weight
    pixels = _sample_rgb(raw, yy+(sv-v)+slope*(su-u), xx+(su-u))

    # Use skin sampled immediately under the eye so that a blink preserves the lens rim.
    coverage = _smooth((blink-.18)/.72)
    limit_top, limit_bottom = -(opening+2.)*lens, (opening+1.5)*lens
    closed_y = top+(bottom-top)*.84
    seam_y = limit_top + (closed_y-limit_top)*float(_smooth(blink))
    weight = (np.clip(v-limit_top+.5, 0, 1)*np.clip(seam_y-v+.5, 0, 1)
              * np.clip(lens*8, 0, 1)*coverage)
    weight += (np.clip(v-seam_y+.5, 0, 1)*np.clip(limit_bottom-v+.5, 0, 1)
               * np.clip(lens*8, 0, 1)*float(_smooth((blink-.66)/.30)))
    weight = np.clip(weight, 0, 1)
    skin = _sample_rgb(raw, 26+slope*u+(opening+3.6)*np.maximum(.45, lens), xx)
    tone = 1-.115*np.exp(-((v+2.5)/4.)**2)*lens
    pixels = pixels*(1-weight[..., None]) + skin*tone[..., None]*weight[..., None]
    seam = np.exp(-((v-seam_y)/.77)**2)*lens**.62*coverage*.83
    pixels = pixels*(1-seam[..., None]) + np.array([56, 33, 26])*seam[..., None]
    return Image.fromarray(np.dstack([np.rint(pixels).astype(np.uint8), raw[:, :, 3]])), xy


@lru_cache(maxsize=16)
def _mesh(pose, width):
    _, base, (left, top, _, _) = _source(pose)
    scale = width/(base.width-48)
    w, h = round(base.width*scale), round(base.height*scale)
    columns = list(range(0, w, 23)) + [w]
    rows = list(range(0, h, 23)) + [h]
    xx, yy = np.meshgrid(columns, rows)
    x, y = left+xx/scale, top+yy/scale
    mouth = MOUTHS[pose]
    hx = (mouth[0]+mouth[2])/2
    lateral = np.clip(1-np.maximum(0, abs(x-hx)-83)/68, 0, 1)
    head = (1-_smooth((y-250)/84))*lateral
    if pose == "thinking":
        hand = .58*np.exp(-.5*((x-522)/35)**2)*np.exp(-.5*((y-282)/35)**2)
        head = np.maximum(head, hand)
    torso = 1-.83*_smooth((y-425)/200)
    arm_x, arm_y = np.zeros_like(x), np.zeros_like(y)
    for px, py, ex, ey, direction in ARMS[pose]:
        vx, vy = px-ex, py-ey
        length = max(1, math.hypot(vx, vy))
        ux, uy = vx/length, vy/length
        along, across = (x-ex)*ux+(y-ey)*uy, (x-ex)*uy-(y-ey)*ux
        falloff = 42 if pose == "thinking" else 65
        wrist = (_smooth((along+18)/(length+15)) * np.exp(-((across/falloff)**4))
                 * np.exp(-((np.maximum(0, along-length-40)/95)**2)))
        arm_x += direction*11*wrist
        arm_y -= 18*wrist
    rects = [(x0, y0, x1, y1) for y0, y1 in zip(rows, rows[1:])
             for x0, x1 in zip(columns, columns[1:])]
    return (w, h), rects, scale, left, top, x, y, head, hx, torso, arm_x, arm_y


def draw_host(shot, speech, controls=None):
    """Render one registered pose at caller-directed placement, optionally with held controls.

    roll/body_roll are degrees, head_dx/head_dy/body_dx/body_dy are source pixels.
    Use blink, brow, gaze and gesture for authored expression/gesture strengths.
    """
    pose, width = shot["pose"], shot["width"]
    if width <= 0:
        raise ValueError("Host width must be positive")
    control = (controls or {}).get
    _, base, (left, top, _, _) = _source(pose)
    image = base.copy()
    mouth, (x0, y0) = _mouth_patch(pose, *speech)
    image.paste(mouth, (x0-left, y0-top))
    for i in range(len(EYES[pose])):
        eye, (x0, y0) = _eye_patch(pose, i, control("blink", 0), control("brow", 0), control("gaze", 0))
        image.paste(eye, (x0-left, y0-top))
    size, rects, scale, left, top, x, y, head, hx, torso, arm_x, arm_y = _mesh(pose, width)
    hr, br = np.deg2rad(control("roll", 0)), np.deg2rad(control("body_roll", 0))
    gesture = control("gesture", 0)
    fx = x - ((-(y-570)*br+control("body_dx", 0))*torso
              + (-(y-286)*hr+control("head_dx", 0))*head + arm_x*gesture) - left
    fy = y - (((x-510)*br+control("body_dy", 0))*torso
              + ((x-hx)*hr+control("head_dy", 0))*head + arm_y*gesture) - top
    corners = np.stack((fx[:-1, :-1], fy[:-1, :-1], fx[1:, :-1], fy[1:, :-1],
                        fx[1:, 1:], fy[1:, 1:], fx[:-1, 1:], fy[:-1, 1:]), axis=2).reshape(-1, 8)
    result = image.transform(size, Image.Transform.MESH, list(zip(rects, corners.tolist())),
                             resample=Image.Resampling.BICUBIC)
    return result, (round(shot["x"]-24*scale), round(shot["y"]-(77-top)*scale))
