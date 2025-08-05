// src/components/charts/MaintenanceCostChart.tsx
import React, { useMemo, useCallback } from 'react';
import { Card } from 'antd';
import { usePavementStore } from '../../store/usePavementStore';
import BarChart from './BarChart';
import type { ChartData, ChartOptions, ChartEvent, ActiveElement } from 'chart.js';
import type { MaintenanceCategory } from '../../types';
import { useTheme } from 'antd-style';
import ChartErrorBoundary from './ChartErrorBoundary';

const CATEGORIES: MaintenanceCategory[] = [
    'Road Reconstruction',
    'Structural Overlay',
    'Surface Restoration',
    'Restoration of Skid Resistance',
    'Routine Maintenance'
];

const CATEGORY_COLORS = {
    'Road Reconstruction': '#ff4d4f',
    'Structural Overlay': '#ff7a45',
    'Surface Restoration': '#40a9ff',
    'Restoration of Skid Resistance': '#73d13d',
    'Routine Maintenance': '#36cfc9'
} as const;

const MaintenanceCostChart: React.FC = () => {
    const {
        categoryCosts,
        isMobileView,
        setSelectedCategory,
    } = usePavementStore();
    const theme = useTheme();

    const handleBarClick = useCallback((_: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const categoryIndex = elements[0].index;
            const category = CATEGORIES[categoryIndex];
            setSelectedCategory(category);
        }
    }, [setSelectedCategory]);

    const backgroundColors = useMemo(() => {
        return CATEGORIES.map(cat => CATEGORY_COLORS[cat]);
    }, []);

    const chartLabels = useMemo(() => {
        return CATEGORIES.map(cat => {
            const shortLabels: Record<MaintenanceCategory, string> = {
                'Road Reconstruction': isMobileView ? 'ROAD\nRECON' : 'ROAD RECONSTRUCTION',
                'Structural Overlay': isMobileView ? 'STRUCT\nOVERLAY' : 'STRUCTURAL OVERLAY',
                'Surface Restoration': isMobileView ? 'SURFACE\nRESTORE' : 'SURFACE RESTORATION',
                'Restoration of Skid Resistance': isMobileView ? 'SKID\nRESIST' : 'RESTORATION OF SKID\nRESISTANCE',
                'Routine Maintenance': isMobileView ? 'ROUTINE\nMAINT' : 'ROUTINE MAINTENANCE'
            };
            return shortLabels[cat];
        });
    }, [isMobileView]);

    const costsData: ChartData<'bar'> = useMemo(() => ({
        labels: chartLabels,
        datasets: [{
            label: 'Cost',
            data: CATEGORIES.map(cat => categoryCosts[cat] / 1e9),
            backgroundColor: backgroundColors,
            borderWidth: 0,
            barPercentage: 0.8,
            categoryPercentage: 0.9
        }]
    }), [chartLabels, categoryCosts, backgroundColors]);

    const baseOptions: ChartOptions<'bar'> = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        onClick: handleBarClick,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: theme.colorBgElevated,
                titleColor: theme.colorText,
                bodyColor: theme.colorText,
                borderColor: theme.colorBorder,
                borderWidth: 1,
                padding: 12,
                displayColors: false,
            }
        },
        scales: {
            x: {
                grid: { display: false, color: theme.colorBorderSecondary },
                ticks: { color: theme.colorTextSecondary, font: { size: isMobileView ? 7 : 8 }, maxRotation: 0, minRotation: 0, autoSkip: false }
            },
            y: {
                grid: { color: theme.colorBorderSecondary },
                ticks: { color: theme.colorTextSecondary, font: { size: 11 } },
                beginAtZero: true
            }
        }
    }), [theme, isMobileView, handleBarClick]);

    const costsOptions: ChartOptions<'bar'> = useMemo(() => ({
        ...baseOptions,
        plugins: {
            ...baseOptions.plugins,
            tooltip: {
                ...baseOptions.plugins?.tooltip,
                callbacks: {
                    label: (context) => `Cost: €${context.parsed.y.toFixed(2)}B`
                }
            }
        },
        scales: {
            ...baseOptions.scales,
            y: {
                ...baseOptions.scales?.y,
                title: { display: !isMobileView, text: 'Cost (bil)' },
                ticks: {
                    ...baseOptions.scales?.y?.ticks,
                    callback: (value) => '€' + Number(value).toFixed(1) + 'B'
                }
            }
        }
    }), [baseOptions, isMobileView]);


    return (
        <Card id="costs-chart-card" title="Maintenance Category Costs" style={{ height: '100%' }} styles={{ body: { height: `calc(100% - ${isMobileView ? '38px' : '57px'})` } }} size={isMobileView ? 'small' : 'default'}>
            <ChartErrorBoundary>
                <BarChart datasetIdKey="costsChart" data={costsData} options={costsOptions} />
            </ChartErrorBoundary>
        </Card>
    );
};

export default MaintenanceCostChart;