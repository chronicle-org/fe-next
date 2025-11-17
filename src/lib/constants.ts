export const toolbarBaseOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  [{ size: ["small", false, "large", "huge"] }],
  ["clean"],
];

export const toolbarExpandedOptions = [
  ...toolbarBaseOptions,
  ["blockquote", "code-block"],
  ["link", "image", "video"],
  [{ list: "ordered" }, { list: "bullet" }],
];

export const toolbarContentOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  ["link", "image", "video", "formula"],

  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],

  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],

  ["clean"],
];


export const fileUploadKey = {
  1: "post/thumbnail",
  2: "profile/banner",
  3: "profile/picture",
}