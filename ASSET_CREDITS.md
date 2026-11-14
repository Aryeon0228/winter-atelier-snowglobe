# Asset credits

## VARCO-generated assets

- `docs/assets/tree.glb`: Studio Aryeon이 VARCO에서 생성하고 선별한 Christmas Tree. [생성 페이지](https://3d.varco.ai/studio/be1c0889-ead4-4a9e-84a3-01f014701262)
- 생성 서비스: [VARCO 3D](https://3d.varco.ai/), NC AI.
- 생성 당시 무료 플랜의 CC BY 4.0 표기를 기준으로 출처를 명시합니다. [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- 수정: 웹용 메시 간소화, 텍스처 크기·형식 최적화, 크기·위치 조정 및 조명·재질 설정.
- `snowglobe.glb`는 위 트리와 절차적 소품을 포함한 조합 장면입니다.

## Procedural assets and audio

- `src/props.js`와 `docs/assets/props/`: Studio Aryeon 프로젝트에서 AI 코드 보조로 제작한 기하학 소품. 외부 에셋 스토어 모델을 사용하지 않았습니다.
- `ornaments.zip`: 방울, 종, 선물상자, 리본, 받침대, 돔 및 선물상자 색 변형 GLB.
- 겨울 실내 배경·창문·전구·환경 반사 맵·눈 결정·눈 더미도 절차적으로 제작했습니다. 외부 HDRI나 배경 사진을 사용하지 않았습니다.
- 효과음: 브라우저 Web Audio 오실레이터로 합성. 음원 파일이나 VARCO Sound 생성물을 사용하지 않았습니다.
- 서체: 운영체제 기본 서체. 외부 폰트 요청 없음.

## Software

Three.js (MIT), esbuild (MIT), glTF Transform (MIT), sharp (Apache-2.0). 의존성의 라이선스는 각 패키지를 따릅니다. 브라우저 번들의 Three.js 저작권 고지는 `docs/app.js.LEGAL.txt`에 보존합니다.

이 저장소는 포트폴리오 검토용으로 공개합니다. 별도로 표시된 라이선스 외에 프로젝트 자체 코드·소품에 대한 추가 재사용 라이선스는 부여하지 않습니다.
