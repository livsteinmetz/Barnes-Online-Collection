// todo: deduplicate #imgUrlLogic
const AWS_BUCKET = process.env.REACT_APP_AWS_BUCKET;
const IMAGES_PREFIX = process.env.REACT_APP_IMAGES_PREFIX;
const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || `//s3.amazonaws.com/${AWS_BUCKET}`;
const imageUrlBase = IMAGES_PREFIX ? `${IMAGE_BASE_URL}/${IMAGES_PREFIX}` : IMAGE_BASE_URL;

const generateObjectImageUrls = (object) => {
  // temp fix for imageSecret missing on some images
  if (!object) {
    return {};
  }

  if (!object.imageSecret) {
    return object;
  }

  const canonicalRoot = (process.env.REACT_APP_CANONICAL_ROOT || '')
  const canonicalRootNoProt = canonicalRoot.replace(/^https?:\/\//i, '')
  // Clone existing object
  const newObject = Object.assign({}, object)
  const imageTrackBaseUrl = `/track/image-download/`
  const imageIdReg = `${object.id}_${object.imageSecret}`
  const imageIdOrig = `${object.id}_${object.imageOriginalSecret}`

  // Construct image urls for object with updated url roots
  newObject.imageUrlSmall = `${imageUrlBase}/${imageIdReg}_n.jpg`;
  newObject.imageUrlOriginal = `${imageUrlBase}/${imageIdOrig}_o.jpg`;
  newObject.imageUrlLarge = `${imageUrlBase}/${imageIdReg}_b.jpg`;
  newObject.imageUrlForWufoo = `${canonicalRootNoProt}${imageTrackBaseUrl}${imageIdOrig}`

  return newObject;
}

const sanitizeEnsembleIndex = (object) => {
  let index = object.ensembleIndex;

  // Update the ensemble index
  object.ensembleIndex = index ? index.split(',')[0] : null;

  return object;
}

export const parseObject = (object) => {
  object = generateObjectImageUrls(object);
  object = sanitizeEnsembleIndex(object);

  return object;
}
