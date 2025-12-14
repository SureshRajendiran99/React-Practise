import { useState, useMemo, useEffect, useCallback } from 'react'
import { Layout, Slider, Notes, TicTacToe, Timer, Accordion, Dropdown } from './components';
import { ToastProvider } from './components/toast'
import './App.css'

type option = {
  label: string;
  value: string | number;
  [key: string]: any
}

function App() {
  const options = useMemo(() => [
    { id: 1, label: 'Notes', value: 'Notes', comp: <Notes />},
    { id: 2, label: 'Layout', value: 'Layout', comp: <Layout />},
    { id: 3, label: 'Timer', value: 'Timer', comp: <Timer />},
    { id: 4, label: 'Tic Tac Toe', value: 'Tic Tac Toe', comp: <TicTacToe />},
    { id: 5, label: 'Accordion', value: 'Accordion', comp: <Accordion />},
    { id: 6, label: 'Slider', value: 'Slider', comp: <Slider />},
  ], []);
  const [selectedOption, setSelectedOption] = useState< option | null>(null);

  useEffect(() => {
    setSelectedOption(options[0]);
  }, [])

  const onChange = useCallback((val: option) => {
    setSelectedOption(val);
  }, [])

  return (
    <ToastProvider>
      <h3 className='text-align'> React Challenges</h3>
      <div className='pad-bottom-10'>
        <label className='font-weight-bold'> Select a component to view: </label>
        <Dropdown option={options} value={selectedOption?.id ?? ''} onChange={onChange} />
      </div>
      {selectedOption?.comp}
    </ToastProvider>
  )
}

export default App
