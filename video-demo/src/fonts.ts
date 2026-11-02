import { continueRender, delayRender, staticFile } from "remotion";

// Loads a variable font from public/fonts so renders never depend on the network.
export const loadLocalFont = (family: string, file: string, weight = "100 900") => {
  if (typeof FontFace === "undefined") return family;
  const handle = delayRender(`Loading ${family}`);
  const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { weight });
  face
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
  return family;
};
