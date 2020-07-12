export type SourceTestInfo = {
  firstName: string;
  lastName: string;
};
export type FinalResultInfo = {
  name: string;
};

export const sourceInfo: SourceTestInfo = {
  firstName: "John",
  lastName: "Doe"
};
export const secondTaskResult: FinalResultInfo = {
  name: "John Doe Silva"
};

export const finalResult: FinalResultInfo = {
  name: "John Doe Silva Santos"
};
