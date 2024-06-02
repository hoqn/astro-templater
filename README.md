# 🚀 Astro Templater

Astro의 Content Collection 구성을 위한, 템플릿이 적용된 `*.md` 또는 `*.mdx` 파일을 생성해줍니다.

쉽게 말해, `/src/content/config.ts`의 Zod 타입 정보를 불러와 이를 바탕으로 적절한 프론트매터를 생성해줍니다!

## 하위 패키지

- 🔖 `@astro-templater/core`: `config.js` 파일을 해석하고 이를 기반으로 적절한 템플릿을 생성하는 핵심 기능이 포함되어 있습니다.

- 🖥️ `@astro-templater/cli`: 명령줄에서 Astro Templater를 사용합니다.

## 시작하기

다른 이유가 없다면 명령줄 버전만 설치하여 사용하는 것이 좋습니다. 빠르고 간단합니다!

npm에 등록되어 있지 않습니다. 직접 빌드해서만 이용하실 수 있어요.  
궁극적으로, Obsidian Plugin으로 활용하기 위해 만들어졌거든요 :)

<!-- ```sh
npm install -g @astro-templater/cli
# or
pnpm install -g @astro-templater/cli
# or
yarn global add @astro-templater/cli
``` -->

### 빌드

```sh
# 모노레포의 루트 디렉터리에서 진행합니다!
pnpm install
pnpm build
```

### 빠른 시작

```sh
# 1.
# 다음 두 경로에서 모두 사용 가능합니다 :)
cd path/to/astro-project-root
cd path/to/astro-project-root/src/content/

# 2.
astro-templater new blog my-new-blog-post --mdx
```

### 명령줄 사용

```sh
# 새로운 파일 생성
astro-templater new <컬렉션 이름>

# 처음부터 파일 이름을 정할 수도 있습니다.
# *.md와 같이 확장자를 포함해도, 포함하지 않아도 정상적으로 동작합니다.
# (--mdx 옵션보다 이때 제시한 확장자가 우선 됩니다)
astro-templater new <컬렉션 이름> [파일 이름]

# mdx 파일은 다음과 같이 만들 수 있습니다.
astro-templater new <컬렉션 이름> [파일 이름] --mdx
astro-templater new <컬렉션 이름> [파일 이름] -x
```

## 계획

- [ ] 완벽한 Validation
- [ ] reference type 반영
- [ ] slug 옵션 추가
- [ ] Obsidian 플러그인으로 확장
