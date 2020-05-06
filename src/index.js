import { runGitLog, getGraph } from "./scraper.js"
// const { runGitLog, getGraph } = require('./scraper')

// takeScreenShot()

async function init() {
  const { stdout, stderr } = await runGitLog()
  await getGraph(stdout)

  return { stdout }
}

init().then(value => {
  console.log(JSON.stringify({ stdout: value.stdout }))
})

// getGraph().then(value => {
//   console.log("getGraph", value)
// })
