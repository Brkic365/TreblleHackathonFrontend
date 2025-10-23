
import styles from '@/styles/components/AnimatedGradientBackground.module.scss';

const AnimatedGradientBackground = () => {
  return (
    <div className={styles.gradientBg}>
      <div className={styles.gradientsContainer}>
        <div className={styles.purpleMass}></div>
        <div className={styles.magentaGlow}></div>
        <div className={styles.purpleSecondary}></div>
        <div className={styles.pinkAccent}></div>
        <div className={styles.depthLayer}></div>
      </div>
    </div>
  );
};

export default AnimatedGradientBackground;