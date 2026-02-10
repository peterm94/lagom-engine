import "./main.css";
import { Platformer } from "./Platformer";
import { GameTemplate } from "./GameTemplate";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="main" style="align-items: center; justify-content: center; height: 100%; display: flex">
  </div>
  <!--  <canvas id="detect-render" width="768" height="768""></canvas>-->
`;
const main = document.querySelector<HTMLDivElement>("#main")!;
const game = new Platformer();
// const game = new GameTemplate();

game.start().then(() => {
    main.appendChild(game.application.canvas);
    game.application.canvas.focus();
});
