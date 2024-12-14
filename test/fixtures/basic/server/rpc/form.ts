import { FormData } from 'formdata-node';
export function handleSingleFormData(data: FormData) {
  const result = {};
  if (data) {
    for (const [key, value] of data.entries()) {
      result[key] = value;
    }
    return result;
  }
}

export function handleFormDataWithParam(name: string, data: FormData) {
  const result = {
    name,
    formData: {},
  };
  for (const [key, value] of data.entries()) {
    result.formData[key] = value;
  }
  return result;
}

export function handleFormDataWithFile(name: string, data: FormData) {
  const file = data.get('file') as File;
  const result = {
    name,
    fileName: file?.name,
    fileType: file?.type,
    fileSize: file?.size,
    otherData: {},
  };

  for (const [key, value] of data.entries()) {
    if (key !== 'file') {
      result.otherData[key] = value;
    }
  }
  return result;
}
