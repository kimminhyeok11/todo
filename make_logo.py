from PIL import Image, ImageDraw, ImageFont

# 48x48 PNG, 흰색 배경
img = Image.new('RGBA', (48, 48), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# 폰트 설정 (윈도우 기본 Arial 사용)
font = ImageFont.truetype("arial.ttf", 12)

# 텍스트 중앙 정렬
text = "3DHACK"
bbox = draw.textbbox((0, 0), text, font=font)
w = bbox[2] - bbox[0]
h = bbox[3] - bbox[1]
draw.text(((48-w)/2, (48-h)/2), text, fill=(0, 184, 148), font=font)

# 저장
img.save("c:\\Users\\salad\\rera\\favicon.png")