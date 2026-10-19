# 뉴웹미디어 (newweb.media)

인터넷신문 등록 신청용 최소 정적 사이트.

- `site.json` — 하단 법정 표기(발행인, 편집인, 청소년보호책임자, 발행소, 연락처 등). **배포 전 실제 정보로 수정.** 등록증 받은 날 `regNo`, `regDate` 채워서 재배포.
- `content.js` — 섹션 메뉴, 게시글(알림), 고정 페이지(회사소개·윤리강령·청소년보호정책·개인정보처리방침 등)
- `static/` — 로고, 파비콘, CSS
- `node build.js` → `dist/` 생성 (의존성 없음)

## 로컬 확인
```
node build.js && python3 -m http.server -d dist   # 확장자 없는 주소는 Docker로 확인: docker build -t nwm . && docker run -p 8080:8080 nwm
```

## Railway 배포
저장소 연결 → Dockerfile 자동 감지 → Settings > Networking에서 커스텀 도메인 `newweb.media` 추가 후 DNS에 CNAME 등록. 포트는 Railway가 주는 `PORT`를 nginx가 사용.
