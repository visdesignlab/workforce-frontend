import React from 'react';

interface AddTaskGlyphProps {
  size?: number;
  fill?: string;
  scale?: number;
}

export function CountiesChanged({ size = 15, fill = "#ccc" }: AddTaskGlyphProps) {
  return (
    <g>
      <circle fill="white" r={size - size / 4} />
      <g>
        <text
          fontSize={size}
          fill={fill}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="FontAwesome"
        >
          &#xf14e;
        </text>
      </g>
    </g>
  );
}

export function ProfessionsChanged({ size = 15, fill = "#ccc" }: AddTaskGlyphProps) {
  return (
    <g>
      <circle fill="white" r={size - size / 4} />
      <g>
        <text
          fontSize={size}
          fill={fill}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="FontAwesome"
        >
          &#xf508;
        </text>
      </g>
    </g>
  );
}

export function YearChanged({ size = 15, fill = "#ccc" }: AddTaskGlyphProps) {
  return (
    <g>
      <circle fill="white" r={size - size / 4} />
      <g>
        <text
          fontSize={size}
          fill={fill}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="FontAwesome"
        >
          &#xf784;
        </text>
      </g>
    </g>
  );
}

export function ModelChanged({ size = 15, fill = "#ccc" }: AddTaskGlyphProps) {
  return (
    <g>
      <circle fill="white" r={size - size / 4} />
      <g>
        <text
          fontSize={size}
          fill={fill}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="FontAwesome"
        >
          &#xf24e;
        </text>
      </g>
    </g>
  );
}

export function MapTypeChange({ size = 15, fill = "#ccc" }: AddTaskGlyphProps) {
  return (
    <g>
      <circle fill="white" r={size - size / 4} />
      <g>
        <text
          fontSize={size}
          fill={fill}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="FontAwesome"
        >
          &#xf1ec;
        </text>
      </g>
    </g>
  );
}

export function MapShapeChange({ size = 15, fill = "#ccc" }: AddTaskGlyphProps) {
  return (
    <g>
      <circle fill="white" r={size - size / 4} />
      <g>
        <text
          fontSize={size}
          fill={fill}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="FontAwesome"
        >
          &#xf558;
        </text>
      </g>
    </g>
  );
}
