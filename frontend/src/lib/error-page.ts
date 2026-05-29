export function renderErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Something went wrong</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #faf9f7;
      color: #1a1a1a;
    }
    main { text-align: center; padding: 2rem; max-width: 24rem; }
    h1 { font-size: 1.5rem; font-weight: 500; margin: 0 0 0.5rem; }
    p { color: #666; margin: 0 0 1.5rem; font-size: 0.875rem; }
    a { color: #1a1a1a; text-decoration: underline; }
  </style>
</head>
<body>
  <main>
    <h1>Something went wrong</h1>
    <p>The server hit an unexpected error. Try refreshing the page.</p>
    <p><a href="/">Go home</a></p>
  </main>
</body>
</html>`;
}
