# Yess Web Frontend

Yess의 웹 프론트엔드 패키지들을 관리하는 모노레포입니다. 각 패키지별 상세 내용은 [패키지 섹션](#packages)에서 확인해 주세요.

## Wiki

- [Rules (Coding Convention & Release Process)](https://additor.atlassian.net/wiki/spaces/YESS/pages/35094535/Rules+Coding+Convention+Release+Process)
- [UI/UX Principles](https://additor.atlassian.net/wiki/spaces/YESS/pages/86212611/UI+UX+Principles)
- [Handover Document](https://additor.atlassian.net/wiki/spaces/YT/pages/149913609/FE+Handover+Document)

## Before start development

#### `yarn dev-initialize-environment`

개발과정에서 필요한 도구를 최초 세팅합니다. 현재는 아래 과정이 포함되어 있습니다.

- `yarn` 을 통해 패키지 설치
- `yarn husky install` 을 통해 husky 를 사용하기 위한 사전 준비

## Scripts

#### `yarn start`

가장 자주 확인하는 @yess/web-app-pcc 패키지의 로컬 환경을 엽니다.

#### `yarn start:widget`

@yess/web-sdk-widget 패키지의 로컬 환경을 엽니다. 유저 웹사이트에 임베드되는 widget의 sdk용 코드 개발시 사용합니다.

#### `yarn storybook`

@yess/web-app-pcc 패키지의 스토리북을 엽니다. 웹앱에서만 사용되는 공통 컴포넌트를 포함합니다.

- develop에 머지될 때마다 chromatic에서 새 빌드가 실행됩니다. [Permalink](https://develop--6583309e07ce96423e2ee872.chromatic.com)를 통해 접근 가능합니다.

#### `yarn storybook:lib`

@yess/components 패키지의 스토리북을 엽니다. 범용적인 yess 디자인 시스템 컴포넌트를 포함합니다.

#### `VERSION=${version} yarn update-elements`

엘리먼트 버전을 패키지별로 한번에 업데이트합니다. `${version}` 부분에 업데이트하고자 하는 버전을 명시합니다.

#### `yarn pre-commit`

lint-staged 라이브러리를 통해 pre-commit 훅을 실행합니다.

## Packages

```bash
├── packages

    ### 공통 패키지 성격
    ├── api # 패키지에 걸쳐서 범용적으로 사용되는 api 호출 함수
    ├── components
        ├── common # 웹앱과 의존성이 없는 컴포넌트 단위의 UI (장기적으로 웹앱으로 옮기는 등 정리가 필요함)
        ├── layout # 디자인 시스템 컴포넌트 (레이아웃 관련)
        ├── lib # 디자인 시스템 컴포넌트
        ├── templates # 웹앱과 의존성이 없는 레이아웃 단위의 UI (장기적으로 웹앱으로 옮기는 등 정리가 필요함)
    ├── constants # 웹앱과 의존성이 없는 상수
    ├── hooks # 웹앱과 의존성이 없는 커스텀 훅
    ├── icons  # svg 파일 및 컴포넌트로 구현된 아이콘 모듈 (장기적으로 tabler icons로 모두 대체후 deprecate)
    ├── storybook # UI 개발환경 및 테스트를 위한 스토리북 패키지
    ├── themes # 스타일과 관련된 상수 (장기적으로 디자인 시스템 토큰으로 이관하여 정리 필요함)
    ├── utils # 웹앱과 의존성이 없는 유틸성 함수

    ### 특정 비즈니스 로직을 담당하는 application 성격
    ├── web-app-form # 웹앱 내의 Lead Form과 위젯 sdk에서 사용되는 Inqury Form 앱
    ├── web-app-pcc # yess 웹앱
    ├── web-app-note # tiptap 라이브러리를 검증하는 노트 앱
    ├── web-sdk-widget # 유저 웹사이트에 임베드되는 위젯 sdk
```

### 새로운 package 추가하기

#### 단독으로 실행 가능한 패키지인 경우 (ex: web-app-pcc, web-app-note)

아래 두가지 옵션 중 한가지를 선택할 수 있음.

1. NextJS 등 프레임워크에서 제공하는 것을 그대로 사용하기
2. 독립적인 인프라를 사용하기

##### 1. 프레임워크에서 제공하는 것을 그대로 사용하기

`packages/` 하위에서 새 프로젝트를 생성하면(ex: `npx create-next-app@latest` 와 같은 명령어 이용) packages 하위에 새로운 폴더가 생성됩니다. 해당 폴더에서 바로 작업을 시작할 수 있습니다.

#### 다른 실행가능한 패키지에서 사용하는 공통 코드인 경우 (ex: api, components, constants, ...)

다른 패키지와 비슷한 구조의 폴더를 만들어서 사용하면 됩니다.

## Deploy

### Process

배포는 다음의 순서로 이루어 집니다. 모든 과정은 CircleCI 에서 수행되고, 자세한 세팅은 [.circleci](.circleci)폴더 내에서 확인 할 수 있습니다.

변경사항 중 업데이트된 파일을 분석하여 배포가 필요한 패키지를 판별합니다.

- 공통 패키지 코드가 변경된 경우에는 모든 application을 배포합니다.
- application 코드만 변경된 경우에는 해당하는 application만 배포합니다.

CircleCI CLI [참고 사이트](https://circleci.com/docs/2.0/local-cli/)

- 로컬 환경에서 docker 를 이용하여 circleci 설정 확인하기: `circleci config validate`

## Design System

### Storybook Public URL

develop 에 push 될 때마다 github action 을 통해 storybook 을 빌드하고 chromatic 에 배포합니다. 배포된 스토리북은 다음의 링크에서 확인할 수 있습니다.

```
https://develop--6583309e07ce96423e2ee872.chromatic.com/
```
