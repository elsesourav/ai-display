import Controls from "../components/Controls";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ToggleButton from "../components/ToggleButton";
import AlwaysActiveToggle from "../components/AlwaysActiveToggle";
import EnableCopyToggle from "../components/EnableCopyToggle";

function PopOuter() {
   return (
      <div className="flex flex-col min-h-full">
         <Header />
         <div className="p-2.5 mt-2 space-y-2 flex-1">
            <ToggleButton />
            <AlwaysActiveToggle />
            <EnableCopyToggle />
            <Controls />
         </div>
         <Footer />
      </div>
   );
}

export default PopOuter;
