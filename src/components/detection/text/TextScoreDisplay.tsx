
import React from "react";
import { textFeatures } from "./TextDetectionMethods";

interface TextScoreDisplayProps {
  confidenceScore: number;
  humanScore: number;
  featureScores: Record<string, number>;
}

export const TextScoreDisplay: React.FC<TextScoreDisplayProps> = ({
  confidenceScore,
  humanScore,
  featureScores
}) => {
  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">AI probability</p>
          <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-orange-500 h-2.5 rounded-full" 
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-right">{confidenceScore}%</p>
        </div>
        <div>
          <p className="text-sm font-medium">Human probability</p>
          <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${humanScore}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-right">{humanScore}%</p>
        </div>
      </div>
      
      {Object.keys(featureScores).length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium mb-2">Text Feature Analysis</p>
          {textFeatures.map((feature) => (
            <div key={feature.name} className="mb-2">
              <div className="flex justify-between text-xs">
                <span>{feature.name}</span>
                <span className={featureScores[feature.name] > 60 ? 'text-orange-500' : 'text-green-500'}>
                  {featureScores[feature.name]}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full ${
                    featureScores[feature.name] > 60 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${featureScores[feature.name]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
