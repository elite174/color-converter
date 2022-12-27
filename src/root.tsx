// @refresh reload
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";

import "./root.css";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Color converter</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta name="description" content="Free color converter app" />
        <Meta
          name="keywords"
          content="SolidJS, Color, Converter, Free, App, SPA, HSL, RGB, HEX"
        />
        <Meta name="author" content="Vladislav Lipatov" />
      </Head>
      <Body>
        <ErrorBoundary>
          <Routes>
            <FileRoutes />
          </Routes>
        </ErrorBoundary>
        <Scripts />
      </Body>
    </Html>
  );
}
