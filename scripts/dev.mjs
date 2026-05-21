import { spawn } from 'node:child_process'

const commands = [
  { name: 'api', script: 'dev:api' },
  { name: 'vite', script: 'dev:vite' },
]

const children = commands.map(({ name, script }) => {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm'
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', `npm.cmd run ${script}`] : ['run', script]

  const child = spawn(command, args, {
    cwd: process.cwd(),
    shell: false,
    stdio: ['inherit', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (chunk) => process.stdout.write(`[${name}] ${chunk}`))
  child.stderr.on('data', (chunk) => process.stderr.write(`[${name}] ${chunk}`))
  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code
      children.forEach((running) => {
        if (running !== child && !running.killed) {
          running.kill()
        }
      })
    }
  })

  return child
})

function shutdown() {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill()
    }
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
