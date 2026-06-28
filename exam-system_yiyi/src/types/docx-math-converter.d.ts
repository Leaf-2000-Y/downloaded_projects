declare module '@hungknguyen/docx-math-converter' {
  export function convertMathMl2Math(mathml: string): any;
  export function convertOmml2Math(omml: string): any;
  export function convertLatex2Math(latex: string): any;
  export function mathJaxReady(): Promise<void>;
}
