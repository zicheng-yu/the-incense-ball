const fs=require('fs'),path=require('path');
const audio=require('/Users/admin/.codex/plugins/cache/ls-extensions/ls-clad/local/skills/build-sfx/tools');
const PROJECT_ASSETS_SFX='/Users/admin/Desktop/LearnARwithSPECS/Assets/GeneratedSFX';
fs.mkdirSync(PROJECT_ASSETS_SFX,{recursive:true});
for (const name of ['IncensePivotClick','IncenseSelectClick']) {
 let b=audio.sfx_presets.uiClick({character:'soft',pitch:name==='IncensePivotClick'?-5:1});
 b=audio.mix_bus.applyFx(b,{hpf:100,lpf:4500,gain:0.7});
 audio.fadeOut(b,0.008);audio.mix_bus.masterChain(b,{normalize:'peak'});
 audio.WavBuilder.write(b,path.join(PROJECT_ASSETS_SFX,name+'.wav'));
}
