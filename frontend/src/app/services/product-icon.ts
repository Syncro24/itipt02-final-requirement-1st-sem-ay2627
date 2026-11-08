import {
  batteryChargingOutline,
  bulbOutline,
  cameraOutline,
  cubeOutline,
  flashOutline,
  gameControllerOutline,
  hardwareChipOutline,
  headsetOutline,
  keypadOutline,
  laptopOutline,
  phonePortraitOutline,
  tvOutline,
  volumeHighOutline,
  watchOutline,
} from 'ionicons/icons';

/** Pass to addIcons() in any component that shows productIcon(). */
export const productIconSet = {
  batteryChargingOutline,
  bulbOutline,
  cameraOutline,
  cubeOutline,
  flashOutline,
  gameControllerOutline,
  hardwareChipOutline,
  headsetOutline,
  keypadOutline,
  laptopOutline,
  phonePortraitOutline,
  tvOutline,
  volumeHighOutline,
  watchOutline,
};

const RULES: [RegExp, string][] = [
  [/keyboard/, 'keypad-outline'],
  [/watch/, 'watch-outline'],
  [/headphone|headset|earbud|earphone/, 'headset-outline'],
  [/speaker/, 'volume-high-outline'],
  [/power ?bank|battery/, 'battery-charging-outline'],
  [/charger|cable|adapter|hub/, 'flash-outline'],
  [/camera|webcam/, 'camera-outline'],
  [/phone/, 'phone-portrait-outline'],
  [/laptop|notebook/, 'laptop-outline'],
  [/\btv\b|monitor|screen|display/, 'tv-outline'],
  [/game|controller|console/, 'game-controller-outline'],
  [/lamp|light|bulb/, 'bulb-outline'],
];

export function productIcon(name: string | null | undefined, category?: string | null): string {
  const text = (name ?? '').toLowerCase();
  const hit = RULES.find(([pattern]) => pattern.test(text));
  if (hit) return hit[1];
  return (category ?? '').toLowerCase() === 'electronics' ? 'hardware-chip-outline' : 'cube-outline';
}