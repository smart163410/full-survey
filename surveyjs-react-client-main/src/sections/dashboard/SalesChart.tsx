import { useReduxDispatch, useReduxSelector } from '../../redux'
import { useEffect, useState, ChangeEvent } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, Stack, useMediaQuery } from '@mui/material';

// project import
import MainCard from '../../components/MainCard';
import useConfig from '../../hooks/useConfig';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// types
import { ThemeMode } from '../../types/config';

// chart options
const columnChartOptions = {
  chart: {
    type: 'bar',
    height: 360
  },
  plotOptions: {
    bar: {
      columnWidth: '30%',
      borderRadius: 10,
      dataLabels: {
        position: 'top', // top, center, bottom
      },
    }
  },
  dataLabels: {
    enabled: true,
    formatter(val: number) {
      return val + "%";
    },
    offsetY: -18,
    style: {
      fontSize: '16px',
      colors: ["#304758"]
    }
  },
  stroke: {
    show: true,
    width: 8,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['Cell Weighting', 'Raking', 'Linear Regression', 'Logistic Regression'],
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    crosshairs: {
      fill: {
        type: 'gradient',
        gradient: {
          colorFrom: '#D8E3F0',
          colorTo: '#BED1E6',
          stops: [0, 100],
          opacityFrom: 0.4,
          opacityTo: 0.5,
        }
      }
    },
    tooltip: {
      enabled: true,
    }
  },
  yaxis: {
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
      formatter(val: number) {
        return val + "%";
      }
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter(val: number) {
        return val + "%";
      }
    }
  },
  legend: {
    show: false
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        yaxis: {
          show: false
        }
      }
    }
  ],
};

// ==============================|| SALES COLUMN CHART ||============================== //

const SalesChart = () => {
  const results = useReduxSelector(state => state.results.results)
  console.log(results.cellWeighting[0])

  const theme = useTheme();
  const { mode } = useConfig();

  const [legend, setLegend] = useState({
    income: true,
    cos: true
  });

  const { income, cos } = legend;

  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const warning = theme.palette.warning.main;
  const primaryMain = theme.palette.primary.main;
  const successDark = theme.palette.success.dark;

  const initialSeries = [
    {
      name: 'Joe Biden',
      data: [0, 0, 0, 0]
    },
    {
      name: 'Trump',
      data: [0, 0, 0, 0]
    }
  ];

  const [series, setSeries] = useState(initialSeries);

  const handleLegendChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLegend({ ...legend, [event.target.name]: event.target.checked });
  };

  const xsDown = useMediaQuery(theme.breakpoints.down('sm'));
  const [options, setOptions] = useState<ChartProps>(columnChartOptions);

  useEffect(() => {
    setSeries([
        {
          name: 'Joe Biden',
          data: [results.cellWeighting[0], results.rakingMethod[0], results.linearReg[0], results.logisticReg[0]]
        },
        {
          name: 'Trump',
          data: [results.cellWeighting[1], results.rakingMethod[1], results.linearReg[1], results.logisticReg[1]]
        }      
      ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: !(income && cos) && cos ? [primaryMain] : [warning, primaryMain],
      xaxis: {
        labels: {
          style: {
            colors: [secondary, secondary, secondary, secondary]
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: [secondary]
          }
        }
      },
      grid: {
        borderColor: line
      },
      plotOptions: {
        bar: {
          columnWidth: xsDown ? '60%' : '30%'
        }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, secondary, line, warning, primaryMain, successDark, income, cos, xsDown]);

  return (
    <MainCard sx={{ mt: 1 }} content={false}>
      <Box sx={{ p: 2.5, pb: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <FormControl component="fieldset">
            <FormGroup row>
              <FormControlLabel
                control={<Checkbox color="warning" checked={income} onChange={handleLegendChange} name="income" />}
                label="Joe Biden"
              />
              <FormControlLabel control={<Checkbox checked={cos} onChange={handleLegendChange} name="cos" />} label="Trump" />
            </FormGroup>
          </FormControl>
        </Stack>
        <Box id="chart" sx={{ bgcolor: 'transparent' }}>
          <ReactApexChart options={options} series={series} type="bar" height={360} />
        </Box>
      </Box>
    </MainCard>
  );
};

export default SalesChart;
