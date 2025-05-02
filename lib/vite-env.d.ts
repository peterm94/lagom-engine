/// <reference types="vite/client" />
declare module '*.aseprite' {
  const src: string; // Defines the default export as a string
  export default src; // Exports the declared string as the default
}