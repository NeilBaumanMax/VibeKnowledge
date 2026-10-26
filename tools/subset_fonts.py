from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
root=Path(__file__).resolve().parents[1]
text=(root/'film/index.html').read_text()
for name,source in [('display','display.ttf'),('body','body.ttc')]:
    font=TTFont(root/'film/assets/fonts'/source,fontNumber=0)
    opts=subset.Options();opts.flavor='woff2'
    sub=subset.Subsetter(options=opts);sub.populate(text=text);sub.subset(font)
    font.flavor='woff2';font.save(root/'film/assets/fonts'/f'{name}.woff2')
print('Local fonts cover all rendered labels.')
