import { useEffect, useState, useMemo } from 'react'

import { ProofRequestTemplate } from '../../verifier'
import { useConfiguration } from '../contexts/configuration'
import { applyTemplateMarkers, createProofBundleResolver } from '../utils/proofBundle'

export const useTemplates = (): Array<ProofRequestTemplate> => {
  const [proofRequestTemplates, setProofRequestTemplates] = useState<ProofRequestTemplate[]>([])
  const { proofTemplateBaseUrl, proofRequestTemplates: configTemplates } = useConfiguration()
  
  const resolver = useMemo(() => {
    return createProofBundleResolver(proofTemplateBaseUrl, configTemplates)
  }, [proofTemplateBaseUrl, configTemplates])
  
  const acceptDevCredentials = false
  
  useEffect(() => {
    resolver.resolve(acceptDevCredentials).then(templates => {
      if (templates) {
        setProofRequestTemplates(applyTemplateMarkers(templates))
      }
    })
  }, [resolver, acceptDevCredentials])
  
  return proofRequestTemplates
}

export const useTemplate = (templateId: string): ProofRequestTemplate | undefined => {
  const [proofRequestTemplate, setProofRequestTemplate] = useState<ProofRequestTemplate | undefined>(undefined)
  const { proofTemplateBaseUrl, proofRequestTemplates: configTemplates } = useConfiguration()
  
  const resolver = useMemo(() => {
    return createProofBundleResolver(proofTemplateBaseUrl, configTemplates)
  }, [proofTemplateBaseUrl, configTemplates])
  
  const acceptDevCredentials = true

  useEffect(() => {
    resolver.resolveById(templateId, acceptDevCredentials).then(template => {
      if (template) {
        setProofRequestTemplate(applyTemplateMarkers(template))
      } else {
        setProofRequestTemplate(undefined)
      }
    }).catch(error => {
      console.error('Error resolving template:', error);
      setProofRequestTemplate(undefined)
    })
  }, [resolver, templateId, acceptDevCredentials])
  
  return proofRequestTemplate
}
