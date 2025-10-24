
import styles from '@/styles/components/AnimatedGradientBackground.module.scss';

const AnimatedGradientBackground = () => {
  return (
    <div className={styles.gradientBg}>
      <div className={styles.gradientsContainer}>
        <div className={styles.pinkBlob}></div>
        <div className={styles.purpleBlob}></div>
        <div className={styles.pinkBlob2}></div>
        <div className={styles.purpleBlob2}></div>
        <div className={styles.accentBlob1}></div>
        <div className={styles.accentBlob2}></div>
        <div className={styles.detailBlob}></div>
      </div>
    </div>
  );
};

export default AnimatedGradientBackground;