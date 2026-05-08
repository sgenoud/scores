import { observer } from 'mobx-react-lite';
import { NewSheet } from './components/NewSheet';
import { ScoreSheet } from './components/ScoreSheet';
import { useStore } from './storeContext';
import styles from './App.module.css';

const App = observer(() => {
  const store = useStore();

  return (
    <main className={styles.appShell}>
      {store.currentSheet ? <ScoreSheet sheet={store.currentSheet} /> : <NewSheet store={store} />}
    </main>
  );
});

export default App;
