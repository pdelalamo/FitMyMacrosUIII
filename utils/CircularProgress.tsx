import React from 'react';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { View, ViewStyle } from 'react-native';

type CircularProgressProps = {
    size: number;
    strokeWidth: number;
    percentage: number;
    color: string;
    style?: ViewStyle;
    remainingColor?: string;
};

const CircularProgress: React.FC<CircularProgressProps> = ({ size, strokeWidth, percentage, color, style, remainingColor = '#D3D3D3' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    return (
        <View style={[{ width: size, height: size }, style]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={remainingColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    fill="none"
                />
                <SvgText
                    x={size / 2}
                    y={size / 2}
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="12"
                    fill={color}
                >
                    {Math.round(percentage)}%
                </SvgText>
            </Svg>
        </View>
    );
};

export default CircularProgress;
