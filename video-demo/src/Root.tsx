import { Composition } from "remotion";
import { Brand } from "./Brand";
import { Demo } from "./Demo";
import { Episode2 } from "./ep02/Episode";
import { Episode3 } from "./ep03/Episode";
import { Episode as Episode4 } from "./ep04/Episode";
import { Episode as Episode5 } from "./ep05/Episode";
import { Episode as Episode6 } from "./ep06/Episode";
import { Episode as Episode7 } from "./ep07/Episode";
import { Episode as Episode8 } from "./ep08/Episode";
import { Episode as Episode9 } from "./ep09/Episode";
import { Episode as Episode10 } from "./ep10/Episode";
import { Episode as Episode11 } from "./ep11/Episode";
import { Episode as Episode12 } from "./ep12/Episode";
import { Episode as Episode13 } from "./ep13/Episode";
import { Episode as Episode14 } from "./ep14/Episode";
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
    {/* Episode 6: 50 seconds, the Underwater Kingdom in 3D with the series' 2D characters */}
    <Composition id="Ep06" component={Episode6} durationInFrames={1500} fps={30} width={1080} height={1920} />
    {/* Episode 7: 50 seconds, the Snowflake Kingdom in 3D with the series' 2D characters */}
    <Composition id="Ep07" component={Episode7} durationInFrames={1500} fps={30} width={1080} height={1920} />
    {/* Episode 8: 50 seconds, the Enchanted Jungle in 3D with the series' 2D characters */}
    <Composition id="Ep08" component={Episode8} durationInFrames={1500} fps={30} width={1080} height={1920} />
    {/* Episode 9: 50 seconds, the Golden Desert in 3D with the series' 2D characters and an original six-cue score */}
    <Composition id="Ep09" component={Episode9} durationInFrames={1500} fps={30} width={1080} height={1920} />
    {/* Episode 10: 57.4 seconds, the Floating Sky City in 3D, slower dialogue, lip sync v2, a new six-cue score */}
    <Composition id="Ep10" component={Episode10} durationInFrames={1722} fps={30} width={1080} height={1920} />
    {/* Episode 11: 70.4 seconds, the Whispering Underwater Cave, Bloop the octopus, a new six-cue score */}
    <Composition id="Ep11" component={Episode11} durationInFrames={2112} fps={30} width={1080} height={1920} />
    {/* Episode 12: 83.8 seconds, the Ancient Clock Tower, Tock the owl, a new six-cue score */}
    <Composition id="Ep12" component={Episode12} durationInFrames={2514} fps={30} width={1080} height={1920} />
    {/* Episode 13: 115.6 seconds, the Rainbow Bridge, Pico the rainbow chameleon, a new six-cue score */}
    <Composition id="Ep13" component={Episode13} durationInFrames={3468} fps={30} width={1080} height={1920} />
    <Composition id="Ep14" component={Episode14} durationInFrames={3879} fps={30} width={1080} height={1920} />
  </>
);
