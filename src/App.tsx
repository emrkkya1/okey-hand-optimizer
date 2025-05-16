import HandInput from './components/HandInput'

function App() {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>🀄 101 Okey Analyzer</h1>
      <HandInput onHandChange={hand => console.log('Hand:', hand)} />
    </div>
  )
}

export default App