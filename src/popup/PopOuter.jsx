import Controls from "../components/Controls";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ToggleButton from "../components/ToggleButton";
import AlwaysActiveToggle from "../components/AlwaysActiveToggle";
import EnableCopyToggle from "../components/EnableCopyToggle";

function PopOuter() {
   return (
      <>
         <Header />
         <div className="p-2 mt-4">
            <ToggleButton />
            <AlwaysActiveToggle />
            <EnableCopyToggle />
            <br />
            <Controls />
         </div>
         <Footer />
      </>
   );
}

export default PopOuter;
