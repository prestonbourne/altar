# WebGL Image Processing Demo

This application is a image processing tool that leverages WebGL for high-performance photo editing. It performs all image manipulations directly on the GPU using custom GLSL shaders.

This is primarily demo for learning and purposes, for a production application it doesnt make sense to get this low level. I'd reach for a library like Pixi: https://pixijs.com/

## Features
- Real-time image adjustments using WebGL shaders
- Non-destructive editing pipeline
- Core adjustments including:
  - Brightness and contrast
  - Exposure and highlights
  - Color temperature and tint
  - Saturation and vibrance
  - Shadows and blacks

## Roadmap
- Add post processing effects, with framebuffers for each effect
- Add undo/redo
- Add layering

## Technical Implementation

All adjustments are processed in linear color space for maximum accuracy and then converted back to sRGB for display.
You can [see the shaders here](https://github.com/prestonbourne/altar/blob/main/src/shaders/img/frag.glsl).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
