
"use strict";

document.write('<script src="lib/jquery-3.1.1.min.js"></script>');

document.write('<script src="lib/util/NullAudio.js"></script>');
document.write('<script src="lib/util/misc.js"></script>');
document.write('<script src="lib/util/coordinators.js"></script>');
document.write('<script src="lib/util/Delegate.js"></script>');
document.write('<script src="lib/util/polators.js"></script>');
document.write('<script src="lib/util/walkers.js"></script>');
document.write('<script src="lib/util/Resources.js"></script>');
document.write('<script src="lib/util/Drawer.js"></script>');
document.write('<script src="lib/util/ImagePiece.js"></script>');
document.write('<script src="lib/util/Clocker.js"></script>');
document.write('<script src="lib/util/FuzzyValue.js"></script>');
document.write('<script src="lib/util/AudioSequencer.js"></script>');

// ゲームコアの全体を把握したいときは…
//  ・misc.js を見ておこう
//  ・まずは Executant.js を見る。それからシーンを構成するファイル群(GlassScene.js, TimeScene.js, InteractScene.js, FitScene.js)。
//  ・で、behaviors.js, bodies.js, renderers.js。
//  ・最後にその他を見ればなんとなく分かる？
document.write('<script src="lib/core/LeafManager.js"></script>');
document.write('<script src="lib/core/BehaviorHost.js"></script>');
document.write('<script src="lib/core/Executant.js"></script>');
document.write('<script src="lib/core/behaviors.js"></script>');
document.write('<script src="lib/core/bodies.js"></script>');
document.write('<script src="lib/core/anchors.js"></script>');
document.write('<script src="lib/core/colliders.js"></script>');
document.write('<script src="lib/core/renderers.js"></script>');
document.write('<script src="lib/core/movers.js"></script>');
document.write('<script src="lib/core/debugs.js"></script>');
document.write('<script src="lib/core/GlassScene.js"></script>');
document.write('<script src="lib/core/TimeScene.js"></script>');
document.write('<script src="lib/core/InteractScene.js"></script>');
document.write('<script src="lib/core/EngageScene.js"></script>');
document.write('<script src="lib/core/Mistant.js"></script>');
document.write('<script src="lib/core/particles.js"></script>');

document.write('<script src="lib/ext/NumberExecutant.js"></script>');
document.write('<script src="lib/ext/BoingExecutant.js"></script>');
document.write('<script src="lib/ext/DraggableExecutant.js"></script>');
document.write('<script src="lib/ext/FloatExecutant.js"></script>');
document.write('<script src="lib/ext/DraggableFloat.js"></script>');
document.write('<script src="lib/ext/TutorialExecutant.js"></script>');
