# 뉴웹미디어 (newweb.media)

인터넷신문 등록 신청용 최소 정적 사이트.

- `site.json` — 하단 법정 표기 기본값. 실제 값은 Railway Variables(`SITE_*`)로 넣음 (아래 참고)
- `content.js` — 섹션 메뉴, 게시글(알림), 고정 페이지(회사소개·윤리강령·청소년보호정책·개인정보처리방침 등)
- `static/` — 로고, 파비콘, CSS
- `node build.js` → `dist/` 생성 (의존성 없음)

## 로컬 확인
```
node build.js && python3 -m http.server -d dist   # 확장자 없는 주소는 Docker로 확인: docker build -t nwm . && docker run -p 8080:8080 nwm
```

## Railway 배포
1. railway.com → New Project → Deploy from GitHub repo → `nwm-core` 선택 (Dockerfile 자동 인식)
2. 서비스 → Variables → Raw Editor에 아래 붙여넣고 값 수정 → Deploy
3. Settings → Networking → Custom Domain에 `newweb.media` 추가 → 안내된 DNS 레코드를 도메인 업체에 등록

```
SITE_PUBLISHER=발행인 성명
SITE_EDITOR=편집인 성명
SITE_YOUTH_OFFICER=청소년보호책임자 성명
SITE_PRIVACY_OFFICER=개인정보보호책임자 성명
SITE_ADDRESS=발행소 주소
SITE_PHONE=02-000-0000
SITE_EMAIL=news@newweb.media
SITE_REPORT_EMAIL=tip@newweb.media
SITE_PUB_DATE=2026-10-19
SITE_REG_NO=
SITE_REG_DATE=
SITE_BIZ_NO=
```
사이트는 컨테이너 시작 시 빌드되므로 변수 수정 후 재배포만 하면 반영됨. `site.json`의 모든 키를 `SITE_` + 대문자 스네이크케이스로 덮어쓸 수 있음.
