# Asset credits

## VARCO-generated assets

- `docs/assets/tree.glb`: Studio Aryeon이 VARCO에서 생성하고 선별한 Christmas Tree. [생성 페이지](https://3d.varco.ai/studio/be1c0889-ead4-4a9e-84a3-01f014701262)
- 생성 서비스: [VARCO 3D](https://3d.varco.ai/), NC AI.
- 생성 당시 무료 플랜의 CC BY 4.0 표기를 기준으로 출처를 명시합니다. [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- 수정: 웹용 메시 간소화, 텍스처 크기·형식 최적화, 크기·위치 조정 및 조명·재질 설정.
- `snowglobe.glb`는 위 트리와 절차적 소품을 포함한 조합 장면입니다.

## VARCO 제작 이미지와 작업 화면

- `docs/assets/provenance/tree-studio.jpg`, `angel-studio.jpg`: 제작 중 저장한 VARCO 편집기 스크린샷. 상단 계정·크레딧 영역을 제외하고 잘라 웹용 JPEG로 저장했습니다. 새로 캡처한 현재 화면이나 오프라인 렌더가 아닙니다.
- `tree-concept.jpg`, `bauble-concept.jpg`, `bell-concept.jpg`, `gift-concept.jpg`, `angel-concept.jpg`: 이 프로젝트에서 VARCO로 생성한 2D 디자인 이미지의 웹용 사본. 3D 파일이나 편집기 스크린샷이 아닙니다.
- 씬에 실제 사용하는 VARCO 3D 모델은 트리 본체입니다. 방울·종·선물은 위 생성 이미지의 형태와 색을 참고해 코드로 3D 형상을 제작했습니다.
- `angel-concept.jpg`는 팔을 약 45도 내린 SoftFace 버전의 VARCO 2D 생성 이미지입니다. 캐릭터 디자인 갤러리에 표시합니다.
- 천사 3D 생성 실험은 제작 기록으로만 공개하며 현재 씬·다운로드 장면에는 포함하지 않습니다.

## Procedural assets and audio

- `src/props.js`와 `docs/assets/props/`: Studio Aryeon 프로젝트에서 AI 코드 보조로 제작한 기하학 소품. 외부 에셋 스토어 모델을 사용하지 않았습니다.
- `ornaments.zip`: 방울, 종, 선물상자, 리본, 받침대, 돔, 눈사람, 우체통 및 선물상자 색 변형 GLB.
- 겨울 실내 배경·창문·전구·환경 반사 맵·눈 결정·눈 더미도 절차적으로 제작했습니다. 외부 HDRI나 배경 사진을 사용하지 않았습니다.
- 오너먼트 종소리: 사용자가 제공한 VARCO Sound 생성 파일 `bell_ring(GEN_3).wav`를 두 구간으로 편집했습니다. `docs/assets/audio/ornament-bell-a.wav` (1.10초), `ornament-bell-b.wav` (1.23초). 원본의 서로 다른 타격 구간을 사용했고 DC 제거·앞뒤 페이드·음량 정리를 적용했습니다. [편집 정보와 원본 해시](docs/assets/audio/bell-manifest.json).
- 원본은 사용자 제공 자료이며 생성 프롬프트는 아직 기록되지 않았습니다. 편집한 두 파일만 웹에 포함합니다.
- 나무 흔들림: 사용자 제공 VARCO Sound 파일 `pine_rustle(GEN_3).wav`. `docs/assets/audio/tree-rustle.wav` (1.48초)에 원래 길이를 유지하며 저·고역 정리, 음량 감소와 짧은 페이드를 적용했습니다. 웹에서는 낮은 볼륨으로 재생하고, 종소리가 활성화된 동안 추가로 낮춥니다. [편집 정보](docs/assets/audio/rustle-manifest.json).
- 배경음악: 사용자 제공 `Winter Snow Globe.wav`의 처음 42초를 사용했습니다. 41초 이후 음량이 잦아드는 구간에서 1초 페이드아웃, 시작에 40ms 페이드인을 적용했습니다. 스테레오를 유지하고 웹용 MP3와 다운로드용 PCM WAV를 제공합니다. 생성 서비스·프롬프트는 확인되지 않아 별도로 단정하지 않습니다. [편집 정보](docs/assets/audio/music-manifest.json).
- 기타 상호작용의 기존 간단한 차임은 브라우저 Web Audio 오실레이터 합성입니다. 눈사람·우체통·편지 전용 VARCO 음원은 아직 포함하지 않았습니다.
- 서체: 운영체제 기본 서체. 외부 폰트 요청 없음.

## Software

Three.js (MIT), esbuild (MIT), glTF Transform (MIT), sharp (Apache-2.0). 의존성의 라이선스는 각 패키지를 따릅니다. 브라우저 번들의 Three.js 저작권 고지는 `docs/app.js.LEGAL.txt`에 보존합니다.

이 저장소는 포트폴리오 검토용으로 공개합니다. 별도로 표시된 라이선스 외에 프로젝트 자체 코드·소품에 대한 추가 재사용 라이선스는 부여하지 않습니다.
