import { Composition } from "remotion";
import { Brand } from "./Brand";
import { Demo } from "./Demo";
import { Episode2 } from "./ep02/Episode";
import { Episode3 } from "./ep03/Episode";
import { Episode as Episode4 } from "./ep04/Episode";
import { Episode as Episode5 } from "./ep05/Episode";
import { LittleStarStory } from "./story/Story";

export const RemotionRoot = () => (
  <>
    {/* 10 seconds at 30fps, 1080p */}
    <Composition id="Demo" component={Demo} durationInFrames={300} fps={30} width={1920} height={1080} />
    {/* 15 seconds at 30fps, 1080p */}
    <Composition id="Brand" component={Brand} durationInFrames={450} fps={30} width={1920} height={1080} />
    {/* 40 seconds at 30fps, vertical 9:16 */}
    <Composition id="LittleStar" component={LittleStarStory} durationInFrames={1200} fps={30} width={1080} height={1920} />
    {/* Episode 2: 45 seconds at 30fps, vertical 9:16 */}
    <Composition id="Ep02MysteriousDoor" component={Episode2} durationInFrames={1350} fps={30} width={1080} height={1920} />
    {/* Episode 3: 45 seconds at 30fps, vertical 9:16 */}
    <Composition id="Ep03RainbowButterfly" component={Episode3} durationInFrames={1350} fps={30} width={1080} height={1920} />
    <Composition id="Ep04" component={Episode4} durationInFrames={1350} fps={30} width={1080} height={1920} />
    {/* Episode 5: 50 seconds, a 3D world (Three.js) with the series' 2D characters */}
    <Composition id="Ep05" component={Episode5} durationInFrames={1500} fps={30} width={1080} height={1920} />
  </>
);
