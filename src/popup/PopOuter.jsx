import Controls from "../components/Controls";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ToggleButton from "../components/ToggleButton";

function PopOuter() {
   return (
      <>
         <Header />
         <div className="p-2 mt-4">
            <ToggleButton />
            <br />
            <Controls />
         </div>
         <Footer />
      </>
   );
}

export default PopOuter;
