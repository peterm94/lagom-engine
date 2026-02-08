import "./main.css";
import { InputTesting } from "./InputTesting";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="main" style="align-items: center; justify-content: center; height: 100%; display: flex">
  </div>
`;
const main = document.querySelector<HTMLDivElement>("#main")!;
const game = new InputTesting();

game.start().then(() => {
    main.appendChild(game.application.canvas);
    game.application.canvas.focus();
});
