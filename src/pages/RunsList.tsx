import React, {useEffect, useState} from "react";
import NavigationBar, * as Buttons from "components/NavigationBar";

import { Box } from "@mui/material";
import {useHistory} from "react-router-dom";
import {useSelector, useStore} from "react-redux";
import {selectAddress} from "../store/selectors";
import Axios from 'axios';
import {setDevices} from "../store/actions";
import {DeviceSpec} from "store/state";
import RunsSelection from "../components/RunsSelection";
import {Runs} from "../models/Runs";

interface AvailableDevice {
  name: string;
  specs: DeviceSpec;
}

interface AvailableDevicesResponse {
  devices: AvailableDevice[];
}

const RunsList = () => {
  const store = useStore();
  const history = useHistory();
  const address = useSelector(selectAddress);
  const [runs, setRuns] = useState<Runs>({runs: []});

  useEffect(() => {
    Axios.get<Runs>(`${address}/runs`)
      .then((response) => {
        setRuns(response.data);
      })
      .catch((_) => {
        alert("Failed to retrieve active runs. Is proxy running?");
      });
  }, []);

  const onSelect = (runId: string) => {
    Axios.get<AvailableDevicesResponse>(`${address}/available-devices`, {
      headers: {
        runId: runId
      }
    })
      .then((response) => {
        const devices = response.data.devices;
        store.dispatch(setDevices(devices.map((device) => ({name: device.name, specs: device.specs, messages: {}, isSelected: false, ids: [], displayedMessage: undefined}))));
        history.push(`/runs/${runId}/dashboard`);
      })
      .catch((_) => {
        alert("Failed to connect. Is proxy running?");
      });
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <NavigationBar>
        <Buttons.Disconnect />
      </NavigationBar>
      <RunsSelection runs={runs} onSelect={onSelect}/>
    </Box>
  )
};

export default RunsList;