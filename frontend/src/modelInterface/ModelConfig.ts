export type ModelConfig = {
  modelname: string;
  email: string;
  file: File;
  name: string;
  header: number;
  separator: string;
  skip: number;
  author: string;
  description: string;
  source: string;
  from: string;
  to: string;
  stepSize: string;
  model: string;
  removedProfessions: Array<string>
};

export function getDefaultModelConfig(): ModelConfig {
  return {
    modelname: '',
    email: '',
    file: new File([""], "filename"),
    name: '',
    header: 0,
    separator: ';',
    skip: -1,
    author: '',
    description: '',
    source: '',
    from: '2019',
    to: '2029',
    stepSize: '5',
    model: 'ideal_staffing',
    removedProfessions: [],
  };
}
