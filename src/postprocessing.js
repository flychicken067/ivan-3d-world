// src/postprocessing.js
import { EffectComposer, EffectPass, RenderPass, BloomEffect, ToneMappingEffect, VignetteEffect } from 'postprocessing';
import { ACESFilmicToneMapping } from 'three';

export function initPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);

  // Base render
  composer.addPass(new RenderPass(scene, camera));

  // Bloom — subtle glow on bright objects
  const bloom = new BloomEffect({
    intensity: 0.4,
    luminanceThreshold: 0.7,
    luminanceSmoothing: 0.3,
    mipmapBlur: true,
  });

  // Tone mapping — cinematic color grading
  const toneMapping = new ToneMappingEffect({
    mode: ACESFilmicToneMapping,
  });

  // Vignette — dark edges for focus
  const vignette = new VignetteEffect({
    offset: 0.3,
    darkness: 0.4,
  });

  composer.addPass(new EffectPass(camera, bloom, toneMapping, vignette));

  return composer;
}
