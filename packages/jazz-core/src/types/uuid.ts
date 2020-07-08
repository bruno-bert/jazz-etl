interface ArrayLike<T> {
  length: number;
  [n: number]: T;
}

export type OutputBuffer = ArrayLike<number>;
export type InputBuffer = ArrayLike<number>;

export interface RandomOptions {
  random?: InputBuffer;
}
export interface RngOptions {
  rng?: () => InputBuffer;
}

export type V4Options = RandomOptions | RngOptions;
export type v4String = (options?: V4Options) => string;
export type v4Buffer = <T extends OutputBuffer>(
  options: V4Options | null | undefined,
  buffer: T,
  offset?: number
) => T;
export type v4 = v4Buffer & v4String;
