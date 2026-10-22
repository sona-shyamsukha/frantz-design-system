/* Variant B hypotheses, kept separate from the current portal. */
(function (root) {
  'use strict';
  function includesMaterial(content) { return !!content && content.scope === 'plan-material'; }
  function scope(content) {
    var material = content.material;
    return material && material.modus !== 'hjelp' && material.bilde ? 'plan-material' : 'plan';
  }
  // A request can accompany the order only when it describes the submitted content.
  function forOrder(request, fingerprint) { return request && request.state !== 'superseded' && request.fingerprint === fingerprint ? request : null; }
  function clearsMaterial(request, status) { return status === 'approved' && includesMaterial(request.content); }
  root.FrantzApprovalRules = { scope: scope, includesMaterial: includesMaterial, forOrder: forOrder, clearsMaterial: clearsMaterial };
})(window);
