import "../../../style/Beranda.css";
import BerandaUtama from "../../backbone/BerandaUtama";
import AnimatedSection from "../../part/AnimatedSection";

export default function PICPKNOW() {
  return (
    <div className="app-container">
      <main>
        <AnimatedSection>
        <BerandaUtama />
        </AnimatedSection>
      </main>
    </div>
  );
}
