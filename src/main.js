import { HELP_SECTIONS } from "./help.js";

const dialog = document.getElementById("help-dialog");
const content = document.getElementById("help-content");

for (const section of HELP_SECTIONS) {
  const heading = document.createElement("h3");
  heading.textContent = section.title;
  const list = document.createElement("ul");
  for (const line of section.lines) {
    const item = document.createElement("li");
    item.textContent = line;
    list.append(item);
  }
  content.append(heading, list);
}

const toggleHelp = () => (dialog.open ? dialog.close() : dialog.showModal());
document.getElementById("help-button").addEventListener("click", toggleHelp);
document.addEventListener("keydown", (event) => {
  if (event.key === "h" || event.key === "H") toggleHelp();
});
