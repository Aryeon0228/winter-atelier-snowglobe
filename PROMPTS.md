# 제작 프롬프트와 구현 기록

트리 수정은 저장된 화면의 원문 발췌. 나머지 영문은 당시 입력 로그를 확보하지 못해 사용자 대화의 제작 의도와 결과 이미지를 바탕으로 2026-11-15 재구성한 문구이며, 실제 입력 원문이 아닙니다. 웹 구현 요청은 현재 대화에서 확인한 사용자 문구의 발췌입니다.

## 트리 2D 콘셉트

- 기록 구분: 제작 의도 기반 재구성 — 실제 입력 원문 아님
- 대응 이미지: [보기](docs/assets/provenance/tree-concept.jpg)

```text
A large, undecorated Christmas evergreen tree for a miniature snow globe. A broad, layered silhouette with full green foliage, a short visible trunk, and one rounded golden star on top. Leave plenty of room to add hanging ornaments later. Cute stylized toy-like proportions, softly rounded forms, clean materials, full object centered on a plain white background. No baubles, ribbons, presents, text, or extra objects.
```

장식을 직접 달 수 있도록 큰 트리와 비어 있는 표면을 먼저 확보했습니다. 3D 변환 뒤 생긴 잎 사이의 빈틈은 다음 단계에서 수정했습니다.

## 트리 3D 형태 수정

- 기록 구분: 실제 입력 원문 발췌
- 대응 이미지: [보기](docs/assets/provenance/tree-studio.jpg)

```text
Replace the entire perforated foliage with FIVE solid, plump, overlapping evergreen tiers.
```

구멍이 많은 잎 구조를 닫힌 다섯 단의 덩어리로 바꾸고, 웹에서 사용할 수 있도록 메시와 텍스처를 최적화했습니다.

저장된 VARCO 편집기 스크린샷에서 판독한 첫 문장입니다. 입력 전체를 복원한 것은 아닙니다.

## 크리스마스 볼

- 기록 구분: 제작 의도 기반 재구성 — 실제 입력 원문 아님
- 대응 이미지: [보기](docs/assets/provenance/bauble-concept.jpg)

```text
One cute Christmas bauble with a glossy burgundy-red spherical body, a wide ivory band around the middle, and one simple raised gold star on the front. Add a small gold cap and hanging loop at the very top. Clean, rounded toy-like forms, a polished 3D-style product illustration, full object centered on a plain white background. No tree, string, text, or extra objects.
```

큰 색 띠와 별로 실루엣을 단순하게 만들었습니다. 웹에서는 꼭대기 고리를 회전축으로 잡아 매달린 방울처럼 흔들리게 했습니다.

## 작은 종

- 기록 구분: 제작 의도 기반 재구성 — 실제 입력 원문 아님
- 대응 이미지: [보기](docs/assets/provenance/bell-concept.jpg)

```text
One small golden Christmas bell with a simple dark-green ribbon bow and a gold hanging loop at the top. A rounded flared bell body, a visible clapper, soft metallic reflections, and clean toy-like proportions. A polished 3D-style product illustration, isolated and fully visible on a plain white background. No tree, hands, text, or extra decorations.
```

종·리본·고리로 특징을 좁혔습니다. 3D는 코드로 재구성하고, 방울과 같은 매달림 반응을 연결했습니다.

## 리본 선물상자

- 기록 구분: 제작 의도 기반 재구성 — 실제 입력 원문 아님
- 대응 이미지: [보기](docs/assets/provenance/gift-concept.jpg)

```text
One cute burgundy-red gift box with softly rounded corners, a slightly wider fitted lid, and a wide ivory ribbon crossing over the box. A soft ivory bow with two full loops on top. Simple, readable forms and a polished 3D-style product illustration, centered on a plain white background. No text, patterns, characters, or extra objects.
```

열기 인터랙션을 위해 3D 상자는 몸통·뚜껑·리본으로 나눴습니다. 리본 고리를 세우고, 컨페티와 자동 닫힘을 추가했습니다.

## 천사 캐릭터 · 팔을 내린 버전

- 기록 구분: 제작 의도 기반 재구성 — 실제 입력 원문 아님
- 대응 이미지: [보기](docs/assets/provenance/angel-concept.jpg)

```text
A cute chibi Christmas angel girl, approximately three heads tall, with a softly tapered face, a short brown bob, gently lowered eyes, delicate upper eyelashes, and faint eyebrows. No visible nose or mouth. A simple burgundy Santa dress with white fur trim, a dark-green chest bow, small white angel wings, a reindeer-antler headband, and short red boots. Front-facing full-body A-pose, arms lowered about 45 degrees from horizontal. Clean 3D-style illustration on a plain white background; no wand, jewelry, or elaborate patterns.
```

얼굴 폭·눈 위치·속눈썹·눈썹 농도를 반복 조정하고, 의상 장식을 단순화했습니다. 선택한 2D 디자인은 남기고 3D 포즈 실험은 현재 씬에서 제외했습니다.

## 실제 웹 구현 요청

### 눈사람 · 놀람과 후속 움직임

> 클릭하면 깜짝 놀라서 폴짝 뛰고 모자 머리 몸통이 분리되었다가 다시 착지하는 느낌으로 애니메이션 잡아줘.
> 눈사람 점프할때 눈가루 흩날리게 해줘

움츠림 → 점프 → 머리·모자 분리 → 순차 착지. 목도리의 잔흔들림과 이륙·착지 눈가루를 함께 구현했습니다.

### 선물 · 열기와 컨페티

> 선물들 누르면 뚜껑 열리면서 컨페티 터지게 해줘
> 그리고 뚜껑 다시 닫히게 해줘

선물별 독립 반응으로 뚜껑과 리본이 들리고 컨페티가 터집니다. 약 2.7초 뒤 닫히며, 작동 중 재클릭으로 동작이 끊기지 않도록 했습니다.

### 우체통 · 스쿼시 앤 스트레치

> 우체통도 클릭할때 약간 스쿼시 스트레치 넣어줘

밑동을 고정한 채 눌림·늘어남·복원을 연결했습니다. 문이 열리고 편지가 올라온 뒤, 메시지를 작성해 카드 이미지로 저장할 수 있습니다.
