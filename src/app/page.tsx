import ChordGenerator from './components/chordgenerator';
import styles from './components/css/page.module.css';
//
export default function Page() 
{ 
  return (
  <div className={styles.body}>
    <div className={styles.title}>
      <h1 className={styles.chordify_title}>
        <span>C</span><span>h</span><span>o</span>
        <span>r</span><span>d</span><span>i</span>
        <span>f</span><span>y</span>
      </h1>
      <p className={styles.signature}>Chord Progression Generator by Zander McGinley</p>
    </div>
    <div>
      <ChordGenerator/>
    </div>
  </div>
  )
}