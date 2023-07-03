webpack dev 를 추가했음.

public 밑에서 그냥 소스를 짜서 간단하게 sql parser 기능을 테스트해볼 수 있음

pegjs --trace -o ./public/tiberoParser.js pegjs/tibero.pegjs 로 만듬

yarn publish output/prod

## 23.07.03 추가

npm --registry https://registry.npmjs.org/ login
npm --registry https://registry.npmjs.org/ publish

용량 초과로 인한 publish 오류를 막을 수 있음.

.map 을 npm publish 에서 제외하도록 설정하면 용량이 1MB 까지 줄어들지만 .map 을 없애도 .umd 때문에 용량 초과는 막을수가 없음.
추후 용량에 대한 개선이 필요하다면 패키지 전체의 구조를 변경해야 할 듯
