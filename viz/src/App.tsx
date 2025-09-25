import { Unstable_SankeyChart as SankeyChart } from "@mui/x-charts-pro/SankeyChart";
import { toSankeyFormat } from "./to-sankey";

const data = toSankeyFormat()

function App() {
  return (
    <>
      <SankeyChart
        sx={{
          width: '100%',
          height: '100%',
        }}

        series={{
          iterations: 4000,
          data: {
            nodes: data.nodes,
            links: data.links,
          },
        }}
      />
    </>
  );
}

export default App;
