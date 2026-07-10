import { useGame } from './state/gameStore';
import { ItalyMap } from './components/ItalyMap';
import { CityScreen } from './components/CityScreen';
import { Passport } from './components/Passport';
import { RipassoDeck } from './components/RipassoDeck';
import { SentenceBuilder } from './components/games/SentenceBuilder';
import { VerbDuel } from './components/games/VerbDuel';
import { VocabMarket } from './components/games/VocabMarket';
import { BossDialogue } from './components/games/BossDialogue';

export default function App() {
  const screen = useGame((s) => s.screen);

  return (
    <div className="app">
      {screen.type === 'map' && <ItalyMap />}
      {screen.type === 'city' && <CityScreen cityId={screen.cityId} />}
      {screen.type === 'passport' && <Passport />}
      {screen.type === 'ripasso' && <RipassoDeck />}
      {screen.type === 'game' && screen.game === 'sentence' && (
        <SentenceBuilder key={screen.cityId} cityId={screen.cityId} />
      )}
      {screen.type === 'game' && screen.game === 'verbs' && (
        <VerbDuel key={screen.cityId} cityId={screen.cityId} />
      )}
      {screen.type === 'game' && screen.game === 'vocab' && (
        <VocabMarket key={screen.cityId} cityId={screen.cityId} />
      )}
      {screen.type === 'game' && screen.game === 'boss' && (
        <BossDialogue key={screen.cityId} cityId={screen.cityId} />
      )}
    </div>
  );
}
